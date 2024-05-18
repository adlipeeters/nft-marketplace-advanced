import { v4 as uuidv4 } from "uuid";
import { FileReq } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
// import { Session } from "next-iron-session";
// import { addressCheckMiddleware, pinataApiKey, pinataSecretApiKey, withSession } from "./utils";
import FormData from "form-data";
import axios from "axios";

type NFTMeta = {
  name: string;
  description: string;
  price: number;
  image: string;
  attributes: any[];
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 15,
}

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      bytes,
      fileName,
      contentType
    } = req.body as FileReq;
    try {
      const nftMeta: NFTMeta = {
        name: req.body.body.name || '',
        description: req.body.body.description || '',
        price: req.body.body.price || 0,
        image: '',
        // TODO: Add more metadata here
        attributes: req.body.body.attributes || []
      }

      if (!bytes || !fileName || !contentType) {
        return res.status(422).send({ message: "Image data are missing" });
      }

      if (nftMeta.name == '' || nftMeta.description == '' || nftMeta.price == 0) {
        return res.status(422).send({ message: "NFT metadata are missing" });
      }

      const buffer = Buffer.from(Object.values(bytes));
      const formData = new FormData();

      formData.append(
        "file",
        buffer, {
        contentType,
        filename: fileName + "-" + uuidv4()
      }
      );

      const fileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
          // ...formData.getHeaders(),
          // 'Authorization': `Bearer ${process.env.PINATA_JWT}`
          pinata_api_key: process.env.API_KEY,
          pinata_secret_api_key: process.env.API_SECRET

        }
      });
      // console.log('fileRes')
      // console.log(fileRes)
      // return res.status(200).send(fileRes.data);
      nftMeta.image = `https://gateway.pinata.cloud/ipfs/${fileRes.data.IpfsHash}`;

      const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        pinataMetadata: {
          name: uuidv4()
        },
        pinataContent: nftMeta
      }, {
        headers: {
          pinata_api_key: process.env.API_KEY,
          pinata_secret_api_key: process.env.API_SECRET
        }
      });
      // console.log('jsonRes')
      // console.log(jsonRes)
      return res.status(200).send(jsonRes.data);

    } catch (error) {
      console.log(error)
    }
  } else {
    return res.status(422).send({ message: "Invalid endpoint" });
  }
}