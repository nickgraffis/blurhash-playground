import React, { FC, useCallback, useRef, useState } from 'react'
import { decode, encode } from 'blurhash'
import { useDropzone } from 'react-dropzone'
import { BlurhashCanvas } from "react-blurhash";
type Props = { }

export const App: FC<Props> = () => {
  const [blurhash, setBlurhash] = useState('')
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const uploadFile = (files: Blob[]) => {
    if (files && files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target) return null
        const res = e.target.result as string;

        const image = new Image();
        const cv = canvas.current;
        const ctx = cv?.getContext("2d");

        image.onload = function () {
          if (!ctx) return null
          ctx.clearRect(0, 0, 200, 200);
          ctx.drawImage(image, 0, 0, 200, 200);
        };
        image.src = res;
        image.style.width = "200px";
        image.style.height = "auto";

        setTimeout(() => {
          const imageData = ctx?.getImageData(0, 0, 150, 150);
          if (imageData) {
            const buffer = encode(imageData.data, 150, 150, 5, 5);
            setBlurhash(buffer);
          }
        }, 500);
      };
      reader.readAsDataURL(files[0]);
    }
  }

  const onDrop = useCallback(acceptedFiles => {
    uploadFile(acceptedFiles);
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center relative overflow-hidden sm:py-12">
        { 
          blurhash &&
          <div className="h-screen w-screen absolute inset-0">
            <BlurhashCanvas
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              hash={blurhash}
              punch={1}
            />
          </div>
        }
      <div style={{ backgroundImage: "url('grid.svg')"}} className="w-screen h-screen absolute inset-0 bg-[url(./grid.svg)] bg-center">
        <div className="mx-auto max-w-3xl py-16">
          <p className="text-4xl font-black text-center">Blurhash Playground</p>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="my-12 w-full p-12 shadow-xl bg-slate-300 rounded-xl h-full">
              {
                isDragActive ?
                <p className="text-center text-3xl text-slate-500 font-black">Drop it!</p> :
                <p className="text-center text-3xl text-slate-500 font-black">Drag image here</p>
              }
            </div>
          </div>
          { blurhash && 
            <pre className="w-full px-4 py-2 rounded-lg bg-slate-800 text-pink-400">
              {blurhash}
            </pre>
          }
        </div>
        <canvas ref={canvas} className="hidden" />
      </div>
    </div>
  )
}