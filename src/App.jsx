import { useState } from 'react'
import { Container, Box, Typography } from '@mui/material'
import WalletConnector from './components/WalletConnector'
import CsvUploader from './components/CsvUploader'
import TokenSender from './components/TokenSender'

export default function App() {
  const [account, setAccount] = useState('')
  const [provider, setProvider] = useState(null)
  const [recipients, setRecipients] = useState([])

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Multi-Sender Airdrop Tool
        </Typography>

        {!account ? (
          <WalletConnector setProvider={setProvider} setAccount={setAccount} />
        ) : (
          <div>
            <Typography variant="body1" gutterBottom>
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </Typography>

            <CsvUploader setRecipients={setRecipients} />

            {recipients.length > 0 && (
              <Typography sx={{ mt: 2 }}>
                {recipients.length} valid addresses loaded
              </Typography>
            )}

            <TokenSender
              provider={provider}
              account={account}
              recipients={recipients}
            />
          </div>
        )}
      </Box>
    </Container>
  )
}