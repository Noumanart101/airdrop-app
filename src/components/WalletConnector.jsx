import { useState } from 'react'
import { ethers } from 'ethers'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function WalletConnector({ setProvider, setAccount }) {
    const connectWallet = async () => {
        try {
            if (!window.ethereum) throw Error('Install MetaMask!')

            const provider = new ethers.BrowserProvider(window.ethereum)
            const accounts = await provider.send("eth_requestAccounts", [])

            setProvider(provider)
            setAccount(accounts[0])
        } catch (error) {
            alert(error.message)
        }
    }

    return (
        <Box sx={{ p: 4 }}>
            <Button variant="contained" onClick={connectWallet}>
                Connect Wallet
            </Button>
            <Typography sx={{ mt: 2 }} color="text.secondary">
                Connect your MetaMask wallet to begin
            </Typography>
        </Box>
    )
}