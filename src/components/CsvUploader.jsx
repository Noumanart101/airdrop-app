import { useState } from 'react'
import Papa from 'papaparse'
import { ethers } from 'ethers'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

export default function CsvUploader({ setRecipients }) {
    const [errors, setErrors] = useState([])

    const validateAddress = (address) => {
        try {
            return ethers.getAddress(address.trim().toLowerCase())
        } catch {
            return null
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]

        Papa.parse(file, {
            complete: (results) => {
                const addresses = results.data.flat()
                const validAddresses = []
                const newErrors = []
                const unique = new Set()

                addresses.forEach((addr, index) => {
                    const validated = validateAddress(addr)

                    if (!validated) {
                        newErrors.push(`Line ${index + 1}: Invalid address`)
                        return
                    }

                    if (unique.has(validated)) {
                        newErrors.push(`Line ${index + 1}: Duplicate address`)
                        return
                    }

                    unique.add(validated)
                    validAddresses.push(validated)
                })

                setErrors(newErrors)
                setRecipients(validAddresses)
            },
            header: false
        })
    }

    return (
        <div>
            <Button variant="outlined" component="label">
                Upload CSV
                <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
            </Button>

            {errors.length > 0 && (
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {errors.map((error, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={error} />
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    )
}