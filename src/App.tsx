import React, { FC, useCallback, useRef, useState } from 'react'
import { decode, encode } from 'blurhash'
import { useDropzone } from 'react-dropzone'
import { BlurhashCanvas } from "react-blurhash";
import Highlight, { defaultProps } from "prism-react-renderer";
import dracula from 'prism-react-renderer/themes/dracula';

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
    <div className="bg-gray-50 py-6 flex flex-col justify-center relative min-h-screen sm:py-12">
        { 
          blurhash &&
          <div className="flex-grow w-screen absolute inset-0">
            <BlurhashCanvas
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              hash={blurhash}
              punch={1}
            />
          </div>
        }
      <div style={{ backgroundImage: "url('grid.svg')"}} className="w-screen h-full overflow-scroll absolute inset-0 bg-[url(./grid.svg)] bg-center">
        <div className="mx-auto max-w-3xl py-16">
          <p className="text-8xl py-2 font-black text-center bg-gradient-to-br from-red-500 via-pink-300 to-red-300 bg-clip-text text-transparent">Blurhash Playground</p>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="relative my-24 w-full p-12 shadow-xl bg-slate-300 rounded-xl h-full">
              <div className="absolute bg-slate-300 rounded-tr-lg rounded-tl-lg px-4 py-2 font-bold text-slate-500 -top-10 z-20">From File</div>
              <div className="absolute bg-slate-300 rounded-tr-lg rounded-tl-lg px-4 py-2 font-bold text-slate-500 -top-10 bg-slate-200 ml-24">From URL</div>
              {
                isDragActive ?
                <p className="text-center text-3xl text-slate-500 font-black">Drop it!</p> :
                <div className="text-center text-3xl text-slate-500 font-black">
                  <p>Drag image here</p>
                  <p>or click here to select an image.</p>
                </div>
              }
            </div>
          </div>
          { blurhash &&
            <div className="space-y-6">
              <pre className="w-full p-6 rounded-lg bg-slate-800 text-pink-400 relative flex items-center">
                <div className="absolute right-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 24 24" className="w-5 h-5 text-white" fill="currentColor"><path d="M5 2v2h4V2H5zm6 0h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2zm0 2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2H2v14h10V4h-1zM4 8h6a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 5h6a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"></path></svg>
                </div>
                {blurhash}
              </pre>
              <pre className="w-full whitespace-pre px-4 py-2 rounded-lg bg-slate-800 text-pink-400">
              <Highlight {...defaultProps} code={`import { decode } from "blurhash";

const pixels = decode(
  "${blurhash}", 
  32, 
  32
);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const imageData = ctx.createImageData(width, height);
imageData.data.set(pixels);
ctx.putImageData(imageData, 0, 0);
document.body.append(canvas);`} language="typescript" theme={dracula}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre className={className} style={style}>
                    {tokens.map((line, i) => (
                      <div {...getLineProps({ line, key: i })}>
                        {line.map((token, key) => (
                          <span {...getTokenProps({ token, key })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
              </pre>
            </div>
          }
        </div>
        <canvas ref={canvas} className="hidden" />
      </div>
    </div>
  )
}