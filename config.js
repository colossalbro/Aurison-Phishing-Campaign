
import { fileURLToPath } from 'url';
import path from 'path';

function dirName() {
    const __filename = fileURLToPath(import.meta.url);
    return path.dirname(__filename)
}


//ACTUAL CONFIGS 
export const PORT = 55000;

export const LIVE = false;

export const OUTPUT_FILE = '';

export const DIR_NAME = dirName();

export const ENV =  LIVE ? 'https://api.aurison.app' : 'https://test-backend.aurison.app';

export const FIREBASE_CONFIG_PATH = dirName() + '/firebase.json'

export const POSTMARK_TOKEN = "063c096a-975c-455d-9403-4ebfccc9aaab";

export const FIREBASE_CREDS = {
    "type": "service_account",
    "project_id": "auris0n",
    "private_key_id": "ef2e2de16026bef91d10bc52f3016652236ab0dd",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCNl0lqzyMy13M7\noYQCIsafOtBYwrU84JCcTAg+np5/7Oc/E+rFLCWgcf2H3u776A22xy7vyaD50PvY\nVJkts/3jQjL/zL11kWNJNiwcccZSEb+DjYqm42vcGLTf+C244I71K/ORFejeQPfg\nc8dYnXC1NBRUZLRt0xAmFkEklDSwTX2zmEZ/uuyjZCegW8cwbw+62K/y5Oa3XAPe\nYayZ4IyIwPiwuX4fo0+jvq3t1utKZt05ZEyscmYL7/Nx75NZINMVwYnueobF+F8e\nf7Jpy3s7Q1DB1wDmbt6ZTwoiBwNhv5SiaX9tNVrXXZPeZdqhHa+FCFUu3rfqfAIg\ncN7xP/w1AgMBAAECggEAHFCLdkBPg+iJavyY8ztkmG2QwhtH1pF64cKjqHAcdq0X\nrmnLelwidyQshOoMRRRp/6nz5TBfUG3eGywJyNW0eSihHb3iCluFbRvX9OU8uWdC\nsupQdqDGjkhjjWFqNU000WsVZWdp/t4jo79Ld1les2Hjid/spAS/9znek5POuI2u\nZXIX9RHxUVsT80W89gN1CTUL0C3mw/rKVo/6tXW0KwTSq7+LMD8+gGqB/+fIASUY\nwoJFDa7dHV9szqu5k8O9lbRUhP+awStWtHzhni+QNtFNwtdAUFCY4YE5XSeJFT7b\nNciZhZK/PvwgQcChQNAgHYmHNNal6kI1Lj4M1Ty+WQKBgQDAoWCupt0Qxm8nTYk9\nb8FVwDV7G/0KvYhQ28b4ZdxHu1Un/rKQFNQAklqTvoe09sDoRfLLpjEfQPDkX3Hf\ndpfKM3Ejik6Q6+WfubcdA0DMWFQMfemNx1D51wuzNoA40agdGHgDofuKQ1aXu7mT\nyPdU+7g9oiAxWE75n/46YeX8fQKBgQC8K46ci+5uJJuNQo/isrB9T1jx4mHcdO9n\n9Lb5JcYNZr0zzTpgkNlxHI3fChGAx6A8Q+9ixyJnLfspz8Tm6UhjDmSS18mdTTJK\nqlhfMavHkvqpsdPAHveVsgOaxY44FgnQX8J9b6hgnPJgl+ApiRr40ntyTztC1flW\n12pzs4fkGQKBgC7B/VnnnxmHUUvVAk8rZV6PPWwYqx+ESiZ2cqGw9/theZYvuOBI\nbf2FiP777Kz8iG7ZK8pLGPlhJhgJIvb/LnEic4AQ/mknGaHfzpb4Ry5S8nPlzF9h\n1kIO9QQXYqBoI8qMOfWHyCsTlV1XcABzc7XpNBuh0vanXOQy9d7uDIlxAoGAAyQe\n/1H+quwFhLglur0M4Sqf63nB9HInRO761vHgenzKj8DPRqlkV9UIMT7zx9iNPjRM\nHLQCSQKlfK8xNEGUqcKlvyXHAc82FbT+QKiNm4lCke6cAEsECwWrtbuyghEsHMRc\ndMeWYfZ8vUwLu+XEA39P/DqCXL1BqkdySXgnvpECgYAo+T51tXyHY62/Td2JfNst\n4wmH32O3/5dtZTUO4g9eVgdgu6doCYu9/szAPCWRWckM4ZTKSWc+Al02Jbxo9ocW\nnzGfNZg70C4e9PaDAvoeaRiNx1/bTMeWfyv+hfgiRpnzwU+4ZuWO7fIYaHNGNUqb\neckvL4QmbtcExAbQ9BZE/g==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-9tdz2@auris0n.iam.gserviceaccount.com",
    "client_id": "100282280790059835346",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-9tdz2%40auris0n.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};  