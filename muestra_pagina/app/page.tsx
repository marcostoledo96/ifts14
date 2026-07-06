import { HeaderInstitucional } from "@/components/validacion/header-institucional"
import { FolioCertificado } from "@/components/validacion/folio-certificado"
import { FooterInstitucional } from "@/components/validacion/footer-institucional"

export default function ValidarCertificadoPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <HeaderInstitucional />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <FolioCertificado />
      </main>

      <FooterInstitucional />
    </div>
  )
}
