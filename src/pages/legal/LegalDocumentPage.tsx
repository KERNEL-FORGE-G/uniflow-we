import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, CalendarClock, FileText, Scale, ShieldCheck, UserCheck } from 'lucide-react'
import { LandingFooter, LandingNavbar } from '../../components/layout/LandingLayout'
import SEOHead from '../../components/SEOHead'
import { LEGAL_DOCUMENTS, LEGAL_UPDATED_AT, type LegalDocument } from '../../data/legal'
import { CONTACT_EMAIL_SECONDARY, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP_URL } from '../../lib/contactInfo'

const ICONS: Record<LegalDocument['slug'], typeof FileText> = {
  cgu: FileText,
  confidentialite: ShieldCheck,
  'mentions-legales': Scale,
  'droits-des-utilisateurs': UserCheck,
}

/**
 * Mise en page commune des quatre documents juridiques : bandeau, table des
 * matières collante sur grand écran, sections ancrées, liens croisés et
 * bloc de contact. Le contenu vient de `data/legal.ts`.
 */
export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const { hash } = useLocation()
  const reduceMotion = useReducedMotion() ?? false
  const Icon = ICONS[document.slug]
  const others = useMemo(() => LEGAL_DOCUMENTS.filter((doc) => doc.slug !== document.slug), [document.slug])

  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0 }); return }
    const target = window.document.getElementById(hash.slice(1))
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [hash, reduceMotion, document.slug])

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827]">
      <SEOHead title={`${document.title} | UniFlow`} description={document.intro} />
      <LandingNavbar />

      <header className="relative overflow-hidden bg-gradient-to-br from-[#152a66] via-[#1e3a8a] to-[#0d9488] text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pt-20">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/25">
              <Icon className="h-3.5 w-3.5" /> Informations légales
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{document.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-blue-100 sm:text-lg">{document.intro}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-100"><CalendarClock className="h-4 w-4" /> Dernière mise à jour : {LEGAL_UPDATED_AT}</p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Sommaire" className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-[#6b7280]">Sommaire</p>
            <ol className="space-y-0.5">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="block rounded-lg px-2 py-1.5 text-sm text-[#374151] transition hover:bg-[#eff3ff] hover:text-[#1e3a8a]">{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-[#6b7280]">Autres documents</p>
            <ul className="space-y-0.5">
              {others.map((doc) => {
                const OtherIcon = ICONS[doc.slug]
                return (
                  <li key={doc.slug}>
                    <Link to={doc.path} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#374151] transition hover:bg-[#f0fdfa] hover:text-[#0d9488]">
                      <OtherIcon className="h-4 w-4 shrink-0" /> {doc.shortTitle}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        <article className="space-y-6">
          {document.sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.2) }}
              className="scroll-mt-28 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-bold text-[#1e3a8a]">{section.title}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#374151]">
                {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                {section.bullets && (
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-[#0d9488]">
                    {section.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                  </ul>
                )}
              </div>
            </motion.section>
          ))}

          <section className="rounded-2xl border border-[#c7d2fe] bg-gradient-to-br from-[#eff3ff] to-[#f0fdfa] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#111827]">Une question sur ces documents ?</h2>
            <p className="mt-2 text-sm text-[#374151]">L'équipe KERNEL FORGE répond sous 30 jours pour toute demande liée à vos données, plus vite pour une simple question.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`mailto:${CONTACT_EMAIL_SECONDARY}`} className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#2d4fa8]">
                {CONTACT_EMAIL_SECONDARY} <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#0d9488] bg-white px-4 py-2.5 text-sm font-semibold text-[#0d9488] transition hover:bg-[#f0fdfa]">
                WhatsApp {CONTACT_PHONE_DISPLAY} <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:border-[#1e3a8a] hover:text-[#1e3a8a]">
                Formulaire de contact
              </Link>
            </div>
          </section>
        </article>
      </main>

      <LandingFooter />
    </div>
  )
}

export default LegalDocumentPage
