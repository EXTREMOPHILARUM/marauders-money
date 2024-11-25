export const generateUUID = (prefix: string = '') => {
  const randomString = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  return prefix ? `${prefix}_${randomString}` : randomString;
};
