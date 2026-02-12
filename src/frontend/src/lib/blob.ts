import { ExternalBlob } from '../backend';

export async function fileToExternalBlob(file: File): Promise<ExternalBlob> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return ExternalBlob.fromBytes(bytes);
}

export function blobToUrl(blob: ExternalBlob): string {
  return blob.getDirectURL();
}
