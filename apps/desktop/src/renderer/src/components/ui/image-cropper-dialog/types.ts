export interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface NormalizedCropRegion {
  /** Left position in [0..1] */
  x: number
  /** Top position in [0..1] */
  y: number
  /** Width in [0..1] */
  width: number
  /** Height in [0..1] */
  height: number
}

export interface CropConfirmPayload {
  /** Crop rect normalized to the rendered image bounds (0..1). */
  normalized: NormalizedCropRegion
  /** Crop rect in pixels relative to the original image (naturalWidth/naturalHeight). */
  pixels: CropRegion
  natural: { width: number; height: number }
}
