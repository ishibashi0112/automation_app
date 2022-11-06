export const base64Encode = async (file) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise((resolve) => (reader.onload = () => resolve()));
  const dataURI = reader.result;
  const base64EncodedFile = dataURI.replace(/data:.*\/.*;base64,/, "");
  return base64EncodedFile;
};

// export const base64Decode =
