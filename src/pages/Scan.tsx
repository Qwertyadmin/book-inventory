import { Box, Button, TextField } from "@mui/material";
import { BarcodeScanner } from "../components/BarcodeScanner";
import { useNavigate } from "react-router-dom";

interface ScanProps {
    code: string,
    setCode: (code: string) => void
}

const Scan: React.FC<ScanProps> = (props) => {

    const navigate = useNavigate()
    
    return (
        <Box className='materialBox'>
            <BarcodeScanner result={props.code} setResult={props.setCode}/>
            <TextField label='Inquadra il codice o scrivi qui' type="tel" value={props.code} onChange={(e) => props.setCode(e.target.value)} margin="dense" fullWidth/>
            <Button className='materialButton' variant="contained" onClick={() => {navigate('/book')}} fullWidth>Cerca libro</Button>
        </Box>
    );
}

export default Scan;