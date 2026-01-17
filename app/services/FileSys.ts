export const getLocalPathFromUri = (uri: string): string => {
    if (!uri) {
      throw new Error('URI cannot be empty');
    }
  
    // Remove file:// protocol prefix if present
    // llama.rn expects native paths without protocol
    return uri.replace(/^file:\/\//, '');
  };