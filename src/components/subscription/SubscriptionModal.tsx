import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Smartphone, CheckCircle, ShieldCheck, Sparkles, Loader2, ArrowRight, Zap, Globe, AlertCircle } from 'lucide-react'
import { subscriptionApi, type PricingInfo } from '../../lib/api'
import { playSuccessSound, playErrorSound } from '../../utils/sound'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [countryCode, setCountryCode] = useState<'CM' | 'FR'>('CM')
  const [pricing, setPricing] = useState<PricingInfo | null>(null)
  const [loadingPricing, setLoadingPricing] = useState<boolean>(false)
  const [selectedProvider, setSelectedProvider] = useState<string>('MTN_MOMO')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const fetchPricing = async () => {
      setLoadingPricing(true)
      try {
        const p = await subscriptionApi.getPricing(countryCode)
        setPricing(p)
        if (p.providers && p.providers.length > 0) {
          setSelectedProvider(p.providers[0])
        }
      } catch (err) {
        console.error('Erreur chargement prix:', err)
      } finally {
        setLoadingPricing(false)
      }
    }
    fetchPricing()
  }, [countryCode, isOpen])

  if (!isOpen) return null

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await subscriptionApi.createCheckout({
        countryCode,
        paymentProvider: selectedProvider,
        phoneNumber: phoneNumber || undefined
      })

      playSuccessSound()
      setSuccessMessage(res.message || 'Votre abonnement a été renouvelé avec succès !')
      if (onSuccess) onSuccess()
      setTimeout(() => {
        setSuccessMessage(null)
        onClose()
      }, 2500)
    } catch (err: any) {
      playErrorSound()
      setErrorMessage(err?.message || 'Erreur lors du traitement du paiement. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Abonnement Personnel UniFlow</span>
            </div>
            <h2 className="text-xl font-black">Renouveler mon accès mensuel</h2>
            <p className="text-xs text-blue-100 mt-1">
              Accès illimité à votre plateforme académique, vos cours et votre synchronisation PWA.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {successMessage ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paiement validé !</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-5">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Choix du Pays / Devise */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Pays & Zone Tarifaire
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCountryCode('CM')}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        countryCode === 'CM'
                          ? 'border-[#0d9488] bg-teal-50/60 dark:bg-teal-950/30 ring-2 ring-[#0d9488]/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">🇨🇲</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Cameroun</div>
                        <div className="text-[11px] font-extrabold text-[#0d9488]">100 FCFA / mois</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCountryCode('FR')}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        countryCode === 'FR'
                          ? 'border-[#1e3a8a] bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-[#1e3a8a]/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">🇫🇷 / 🇪🇺</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">France / International</div>
                        <div className="text-[11px] font-extrabold text-[#1e3a8a]">1,00 € / mois</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Moyen de Paiement */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Méthode de Paiement
                  </label>
                  {loadingPricing ? (
                    <div className="p-4 text-center text-xs text-slate-500">Chargement des moyens de paiement...</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {countryCode === 'CM' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedProvider('MTN_MOMO')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              selectedProvider === 'MTN_MOMO'
                                ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Smartphone className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                            <span className="text-xs">MTN MoMo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProvider('ORANGE_MONEY')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              selectedProvider === 'ORANGE_MONEY'
                                ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Smartphone className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                            <span className="text-xs">Orange Money</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProvider('NOTCHPAY')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              selectedProvider === 'NOTCHPAY'
                                ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <CreditCard className="h-4 w-4 mx-auto mb-1 text-teal-600" />
                            <span className="text-xs">NotchPay / CB</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedProvider('STRIPE')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              selectedProvider === 'STRIPE'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <CreditCard className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                            <span className="text-xs">Stripe / Apple Pay</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProvider('CARD')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              selectedProvider === 'CARD'
                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <CreditCard className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                            <span className="text-xs">Carte Bancaire</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Champ Téléphone / Numéro de compte si Mobile Money */}
                {(selectedProvider === 'MTN_MOMO' || selectedProvider === 'ORANGE_MONEY') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Numéro de téléphone Mobile Money
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ex: 670000000 ou 690000000"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#0d9488] focus:bg-white transition-all"
                      required
                    />
                  </div>
                )}

                {/* Bouton de validation */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Traitement du paiement en cours...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Valider le paiement ({pricing?.formattedPrice || (countryCode === 'CM' ? '100 FCFA' : '1,00 €')})</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
