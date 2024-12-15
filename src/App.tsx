import PDFViewer from '@/components/pdf-viewer'
import { ToastProvider } from '@/components/ui/use-toast'
import { Toaster } from './components/ui/toaster'

export default function Page() {
  return (
    // <ToastProvider>
      <main className="min-h-screen bg-background">
        <Toaster />
        <PDFViewer />
      </main>
    // </ToastProvider>
  )
}

