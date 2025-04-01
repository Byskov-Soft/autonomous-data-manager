export const formDataToJson = (data: string) => {
  const removeNewLines = data.replace(/(?:\r\n|\r|\n)/g, "");
  return JSON.parse(removeNewLines);
};
