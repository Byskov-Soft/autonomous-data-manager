export const transformStringToJson = (data: string) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    // If parsing fails, try removing newlines only from outside of string values
    const cleanData = data.replace(/[\r\n\s]+(?=([^"]*"[^"]*")*[^"]*$)/g, '')
    return JSON.parse(cleanData)
  }
}
