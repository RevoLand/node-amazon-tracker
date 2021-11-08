import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';
import cvision from '../config/cvision';
import { wait } from './common';

// analyze text in image
const readTextFromURL = async (client: ComputerVisionClient, url: string) => {
  const clientRead = await client.read(url);
  const operationID = clientRead.operationLocation.split('/').slice(-1)[0];

  // Wait for read recognition to complete
  // result.status is initially undefined, since it's the result of read
  try {
    let result = await client.getReadResult(operationID);
    while (result.status !== 'succeeded') {
      await wait(1000);
      result = await client.getReadResult(operationID);
    }

    return result.analyzeResult?.readResults.at(0)?.lines.at(0)?.text ?? '';
  } catch (err) {
    return '';
  }
}

// Analyze Image from URL
export const computerVision = async (urlToAnalyze: string): Promise<string> => {

  if (!urlToAnalyze) {
    return '';
  }

  const computerVisionClient = new ComputerVisionClient(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': cvision.key } }), cvision.endpoint
  );

  const captchaText = await readTextFromURL(computerVisionClient, urlToAnalyze);

  // all information about image
  return captchaText;
}
