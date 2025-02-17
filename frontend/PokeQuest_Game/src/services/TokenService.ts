import CryptoJS from 'crypto-js';  // Ensure proper import here

// Function to decode the JWT token
export function decodeJWT(token: string) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT token format');
  }

  // Decode the base64Url encoded string (JWT uses base64Url encoding)
  const decodeBase64Url = (base64Url: string) => {
    base64Url = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64Url.length % 4;
    if (padding) {
      base64Url += '='.repeat(4 - padding); // Add padding to make it valid base64
    }
    console.log('Decoded base64Url:', base64Url); // Log the base64Url string
    return CryptoJS.enc.Base64.parse(base64Url).toString(CryptoJS.enc.Utf8); // Decode base64 string
  };

  const header = JSON.parse(decodeBase64Url(parts[0]));
  const payload = JSON.parse(decodeBase64Url(parts[1]));

  // Log the header and payload
  console.log('Decoded Header:', header);
  console.log('Decoded Payload:', payload);

  return { header, payload };
}
