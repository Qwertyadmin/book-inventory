import { useZxing } from "react-zxing";

interface BarcodeScannerProps {
  result: string | undefined,
  setResult: (result: string) => void
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({result, setResult}) => {

  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  return (
    <>
      <video ref={ref} />
    </>
  );
  };
  