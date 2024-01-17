import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

interface FileSelectorProps {
    spreadsheet: Spreadsheet |null,
    setSpreadsheet: (spreadsheet: Spreadsheet | null) => void,
    spreadsheets: Spreadsheet[],
    loginState: number
}

export interface Spreadsheet {
    id: string,
    label: string,
    inputValue?: string
}

const filter = createFilterOptions<Spreadsheet>();

const FileSelector: React.FC<FileSelectorProps> = (props) => {

  return (
    <Autocomplete
      value={props.spreadsheet}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          props.setSpreadsheet({
            label: newValue,
            id: ''
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          props.setSpreadsheet({
            label: newValue.inputValue,
            id : ''
          });
        } else {
          props.setSpreadsheet(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.label);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            label: `Crea file "${inputValue}"`,
            id: ''
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      fullWidth
      disabled={props.loginState !== 1 ? true : false}
      options={props.spreadsheets}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.label;
      }}
      renderOption={(props, option) => <li {...props}>{option.label}</li>}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Seleziona un file esistente o inserisci il nome del nuovo file" margin="dense" fullWidth/>
      )}
    />
  );
}

export default FileSelector;