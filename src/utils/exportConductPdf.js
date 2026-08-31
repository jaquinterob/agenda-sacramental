import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'

const PX_TO_MM = 25.4 / 96
const MAX_CANVAS_SIDE = 16384
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const PAGE_MARGIN_MM = 8
const BLOCK_GAP_MM = 2
const PDF_EXPORT_WIDTH_PX = 768
const PDF_PIXEL_RATIO = 2

let pendingShare = null
let lastDownloadKey = ''

function slugify(text) {
  return String(text || 'agenda')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function conductPdfFilename(agenda) {
  const ward = slugify(agenda.ward || 'barrio')
  const date = agenda.date || 'fecha'
  return `agenda-${ward}-${date}.pdf`
}

export function canSharePdfFile(file) {
  return (
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] }))
  )
}

export function shouldPromptNativeShare(file) {
  return canSharePdfFile(file)
}

async function layoutFrame() {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  await new Promise((resolve) => setTimeout(resolve, 80))
}

function applyExportLayout(root) {
  root.classList.add('pdf-capture')
  root.style.width = `${PDF_EXPORT_WIDTH_PX}px`
  root.style.maxWidth = `${PDF_EXPORT_WIDTH_PX}px`
}

function restoreExportLayout(root) {
  root.classList.remove('pdf-capture')
  root.style.width = ''
  root.style.maxWidth = ''
}

function getBlockHeightMm(block, contentWidthMm) {
  const scale = contentWidthMm / (block.cssWidth * PX_TO_MM)
  return block.cssHeight * PX_TO_MM * scale
}

function rowInkScore(canvas, y) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return Number.MAX_SAFE_INTEGER
  const row = ctx.getImageData(0, y, canvas.width, 1).data
  let ink = 0
  for (let i = 0; i < row.length; i += 4) {
    if (row[i] < 248 || row[i + 1] < 248 || row[i + 2] < 248) ink += 1
  }
  return ink
}

function bestSliceY(canvas, targetY, radius = 72) {
  const minY = Math.max(1, targetY - radius)
  const maxY = Math.min(canvas.height - 2, targetY + radius)
  let bestY = targetY
  let bestScore = Number.MAX_SAFE_INTEGER

  for (let y = minY; y <= maxY; y += 1) {
    const score = rowInkScore(canvas, y)
    if (score < bestScore) {
      bestScore = score
      bestY = y
    }
  }

  return bestY
}

function addCanvasSlice(pdf, canvas, offsetY, sliceHeightPx, xMm, yMm, widthMm, heightMm) {
  const sliceCanvas = document.createElement('canvas')
  sliceCanvas.width = canvas.width
  sliceCanvas.height = sliceHeightPx
  const ctx = sliceCanvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar el PDF')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
  ctx.drawImage(
    canvas,
    0,
    offsetY,
    canvas.width,
    sliceHeightPx,
    0,
    0,
    canvas.width,
    sliceHeightPx,
  )

  pdf.addImage(
    sliceCanvas.toDataURL('image/png'),
    'PNG',
    xMm,
    yMm,
    widthMm,
    heightMm,
    undefined,
    'SLOW',
  )
}

function placeBlock(pdf, layout, block) {
  const { canvas, cssWidth, pixelRatio } = block
  const { contentWidthMm, contentHeightMm, marginMm } = layout
  const scale = contentWidthMm / (cssWidth * PX_TO_MM)
  const blockHeightMm = getBlockHeightMm(block, contentWidthMm)

  const ensureSpace = (neededMm) => {
    if (layout.cursorY + neededMm > marginMm + contentHeightMm && layout.cursorY > marginMm) {
      pdf.addPage()
      layout.cursorY = marginMm
    }
  }

  if (blockHeightMm <= contentHeightMm) {
    ensureSpace(blockHeightMm)
    addCanvasSlice(
      pdf,
      canvas,
      0,
      canvas.height,
      marginMm,
      layout.cursorY,
      contentWidthMm,
      blockHeightMm,
    )
    layout.cursorY += blockHeightMm + BLOCK_GAP_MM
    return
  }

  const sliceHeightCss = contentHeightMm / scale / PX_TO_MM
  const sliceHeightCanvas = Math.max(1, Math.round(sliceHeightCss * pixelRatio))
  let offsetY = 0

  while (offsetY < canvas.height) {
    const remaining = canvas.height - offsetY
    let sliceHeightPx = Math.min(sliceHeightCanvas, remaining)

    if (remaining > sliceHeightPx) {
      const targetY = offsetY + sliceHeightPx
      const adjustedY = bestSliceY(canvas, targetY)
      sliceHeightPx = Math.max(1, adjustedY - offsetY)
    }

    const sliceHeightMm = (sliceHeightPx / pixelRatio) * PX_TO_MM * scale
    ensureSpace(sliceHeightMm)
    addCanvasSlice(
      pdf,
      canvas,
      offsetY,
      sliceHeightPx,
      marginMm,
      layout.cursorY,
      contentWidthMm,
      sliceHeightMm,
    )
    layout.cursorY += sliceHeightMm

    offsetY += sliceHeightPx

    if (offsetY < canvas.height) {
      pdf.addPage()
      layout.cursorY = marginMm
    } else {
      layout.cursorY += BLOCK_GAP_MM
    }
  }
}

async function captureBlock(element, pixelRatio) {
  const canvas = await toCanvas(element, {
    backgroundColor: '#ffffff',
    pixelRatio,
    cacheBust: true,
  })

  if (!canvas?.height) return null

  return {
    canvas,
    cssWidth: canvas.width / pixelRatio,
    cssHeight: canvas.height / pixelRatio,
    pixelRatio,
  }
}

async function captureBlocks(root) {
  const blockElements = [...root.querySelectorAll('[data-pdf-block]')]
  if (!blockElements.length) throw new Error('No hay contenido para exportar')

  applyExportLayout(root)
  await layoutFrame()

  const blocks = []
  try {
    for (const element of blockElements) {
      const block = await captureBlock(element, PDF_PIXEL_RATIO)
      if (!block) continue
      blocks.push(block)
    }
  } finally {
    restoreExportLayout(root)
  }

  if (!blocks.length) throw new Error('No se pudo capturar la agenda')
  return blocks
}

function buildPdf(blocks) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const contentWidthMm = A4_WIDTH_MM - PAGE_MARGIN_MM * 2
  const contentHeightMm = A4_HEIGHT_MM - PAGE_MARGIN_MM * 2
  const layout = {
    contentWidthMm,
    contentHeightMm,
    marginMm: PAGE_MARGIN_MM,
    cursorY: PAGE_MARGIN_MM,
  }

  for (const block of blocks) {
    placeBlock(pdf, layout, block)
  }

  return pdf
}

function downloadOnce(blob, filename) {
  const downloadKey = `${filename}:${blob.size}`
  if (lastDownloadKey === downloadKey) return
  lastDownloadKey = downloadKey

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
    if (lastDownloadKey === downloadKey) lastDownloadKey = ''
  }, 3000)
}

export function downloadConductPdf(blob, filename) {
  downloadOnce(blob, filename)
}

export async function sharePdfFile(file) {
  await navigator.share({
    files: [file],
    title: 'Agenda sacramental',
  })
}

export async function prepareConductPdf(element, filename) {
  const blocks = await captureBlocks(element)
  const pdf = buildPdf(blocks)
  const blob = pdf.output('blob')

  if (!blob || blob.size < 1000) {
    throw new Error('El PDF generado está vacío')
  }

  const file = new File([blob], filename, { type: 'application/pdf' })
  return { blob, file, filename }
}

export async function shareConductPdf(element, filename) {
  if (pendingShare) return pendingShare

  pendingShare = prepareConductPdf(element, filename).then((prepared) => {
    if (shouldPromptNativeShare(prepared.file)) {
      return { status: 'ready', ...prepared }
    }

    downloadOnce(prepared.blob, prepared.filename)
    return { status: 'downloaded', ...prepared }
  })

  try {
    return await pendingShare
  } finally {
    pendingShare = null
  }
}
