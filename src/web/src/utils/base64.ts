type Encode = (file: File) => Promise<string>;

export const base64Encode: Encode = async (file) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise((resolve) => (reader.onload = () => resolve("")));
  const dataURI = reader.result;

  if (!dataURI || dataURI instanceof ArrayBuffer) {
    throw new Error("画像エンコードに失敗しました。");
  }

  const base64EncodedFile = dataURI.replace(/data:.*\/.*;base64,/, "");
  return base64EncodedFile;
};
