import { useState } from 'react';
import { ethers } from 'ethers';
import { Button, TextField, LinearProgress, Typography } from '@mui/material';
import abis from '../contracts/abis.json';

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

export default function TokenSender({ provider, account, recipients }) {
    const [tokenAddress, setTokenAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Update with your contract address
    const multisenderAddress = import.meta.env.VITE_MULTISENDER_ADDRESS;

    const sendAirdrop = async () => {
        try {
            setLoading(true);
            setStatus('Initializing...');

            const signer = await provider.getSigner();

            // 1. Get token decimals
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
            const decimals = await token.decimals();

            // 2. Calculate total amount
            const amountPerRecipient = ethers.parseUnits(amount, decimals);
            const totalAmount = amountPerRecipient * BigInt(recipients.length);

            // 3. Approve multisender contract
            setStatus('Approving token transfer...');
            const approveTx = await token.approve(multisenderAddress, totalAmount);
            await approveTx.wait();

            // 4. Deposit tokens to multisender
            setStatus('Depositing tokens...');
            const multisender = new ethers.Contract(
                multisenderAddress,
                abis.SecureMultiSender,
                signer
            );

            // 5. Prepare amounts array
            const amounts = Array(recipients.length).fill(amountPerRecipient.toString());

            // 6. Execute multisend
            setStatus('Processing batch transfer...');
            const tx = await multisender.multiSend(tokenAddress, recipients, amounts);
            await tx.wait();

            setStatus('Airdrop completed successfully!');
        } catch (error) {
            setStatus(`Error: ${error.reason || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <TextField
                label="Token Address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
            />

            <TextField
                label="Amount per recipient"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
            />

            <Button
                variant="contained"
                onClick={sendAirdrop}
                disabled={!tokenAddress || !amount || loading}
                sx={{ mt: 2 }}
            >
                Execute Airdrop
            </Button>

            {loading && <LinearProgress sx={{ mt: 2 }} />}
            <Typography sx={{ mt: 1 }}>{status}</Typography>
        </div>
    );
}