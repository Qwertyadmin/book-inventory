import { Button, TextField } from "@mui/material";
import { BarcodeScanner } from "../components/BarcodeScanner";
import { useNavigate } from "react-router-dom";

interface ScanProps {
    code: string | undefined,
    setCode: (code: string) => void
}

const Scan: React.FC<ScanProps> = (props) => {

    const navigate = useNavigate()
    
    return (
        <div>
            <BarcodeScanner result={props.code} setResult={props.setCode}/>
            <TextField label='Inquadra il codice o scrivi qui' value={props.code} onChange={(e) => props.setCode(e.target.value)} margin="dense" fullWidth/>
            <Button variant="contained" onClick={() => {navigate('/book')}} fullWidth>Cerca libro</Button>
        </div>
    );
}

export default Scan;