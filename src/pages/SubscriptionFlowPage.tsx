import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Smartphone, 
  Sparkles, Building2, GraduationCap, User, CheckCircle2, Lock, 
  HelpCircle, Receipt, Download, RefreshCw, Zap
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { personalSubscriptionApi, type CheckoutResult, type SubscriptionPlan, ApiError } from '../lib/api'

export default function SubscriptionFlowPage() {
  const { planId } = useParams<{ planId?: string }>()
  const navigate = useNavigate()

  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Step state: 1 = Plan & Cycle, 2 = Infos & Contact, 3 = Paiement, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUALLY'>('MONTHLY')

  // Form state
  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [institution, setInstitution] = useState<string>('')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Payment state
  const [paymentProvider, setPaymentProvider] = useState<string>('MTN_MOMO')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [transactionResult, setTransactionResult] = useState<CheckoutResult | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        setLoadError(null)
        const fetchedPlans = await personalSubscriptionApi.getPlans()
        setPlans(fetchedPlans)

        const targetCode = planId || 'personal_cm'
        const match = fetchedPlans.find(p => p.code === targetCode || p.id === targetCode)
        if (match) {
          setSelectedPlan(match)
          setPaymentProvider(match.providers?.[0] || '')
        } else if (fetchedPlans.length > 0) {
          setSelectedPlan(fetchedPlans[0])
          setPaymentProvider(fetchedPlans[0].providers?.[0] || '')
        }
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Les offres personnelles ne sont pas disponibles.'
        setLoadError(message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [planId])

  // Fill in stored user info if available
  useEffect(() => {
    const storedUser = localStorage.getItem('uniflow_user')
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        if (u.email) setEmail(u.email)
        if (u.student) {
          setFullName(`${u.student.firstName || ''} ${u.student.lastName || ''}`.trim())
        } else if (u.teacher) {
          setFullName(`${u.teacher.firstName || ''} ${u.teacher.lastName || ''}`.trim())
        }
      } catch {}
    }
  }, [])

  const handleProcessPayment = async () => {
    if (!selectedPlan) return
    if (!paymentProvider) {
      setPaymentError('Aucun moyen de paiement actif n’est fourni par cette formule.')
      return
    }
    if (!fullName.trim() || !email.trim()) {
      setPaymentError('Le nom complet et l’adresse email sont obligatoires.')
      return
    }
    if ((paymentProvider === 'MTN_MOMO' || paymentProvider === 'ORANGE_MONEY') && !phoneNumber.trim()) {
      setPaymentError('Le numéro Mobile Money est obligatoire pour ce moyen de paiement.')
      return
    }
    setIsSubmitting(true)
    setPaymentError(null)
    try {
      const res = await personalSubscriptionApi.createCheckout({
        planCode: selectedPlan.code || selectedPlan.id,
        countryCode: selectedPlan.countryCode || 'CM',
        paymentProvider,
        phoneNumber: phoneNumber.trim() || undefined,
        billingCycle: billingCycle.toLowerCase() as 'monthly' | 'annually',
        email: email.trim(),
        fullName: fullName.trim(),
      })
      setTransactionResult(res)
      setCurrentStep(4)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Le paiement n’a pas pu être initialisé.'
      setPaymentError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cost calculation
  const getBasePrice = () => {
    if (!selectedPlan) return 0
    return billingCycle === 'ANNUALLY' 
      ? (selectedPlan.priceAnnuallyAmount || selectedPlan.priceMonthlyAmount * 10)
      : selectedPlan.priceMonthlyAmount
  }

  const basePrice = getBasePrice()
  const finalPrice = basePrice
  const checkoutStatus = transactionResult?.status?.toUpperCase()
  const paymentConfirmed = checkoutStatus === 'SUCCESS' || checkoutStatus === 'ACTIVE' || checkoutStatus === 'PAID'
  const includedAccess = !!selectedPlan && selectedPlan.priceMonthlyAmount === 0 && selectedPlan.providers.length === 0

  const getCurrencyLabel = () => {
    if (!selectedPlan) return 'FCFA'
    return selectedPlan.currency === 'EUR' ? '€' : 'FCFA'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <LandingNavbar />
        <div className="flex flex-col items-center justify-center py-24 text-slate-600 dark:text-slate-300">
          <RefreshCw className="h-10 w-10 animate-spin text-[#1e3a8a] mb-4" />
          <p className="text-sm font-semibold">Chargement des détails de souscription depuis la base de données...</p>
        </div>
        <LandingFooter />
      </div>
    )
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <LandingNavbar />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <h1 className="text-2xl font-black">Souscription indisponible</h1>
            <p className="mt-3 text-sm">{loadError || 'Aucune formule active n’est encore enregistrée dans Appwrite.'}</p>
            <Link to="/pricing" className="mt-6 inline-flex rounded-xl bg-[#1e3a8a] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Retour aux tarifs</Link>
          </div>
        </div>
        <LandingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <LandingNavbar />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1e3a8a] dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux Formules d'Abonnement</span>
          </Link>

          <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-3 py-1 rounded-full">
            Page de Souscription Sécurisée
          </span>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="mb-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            
            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 1 ? 'text-[#1e3a8a] dark:text-blue-400 font-bold' : 'text-slate-400'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep > 1 
                  ? 'bg-emerald-600 text-white' 
                  : currentStep === 1 
                  ? 'bg-[#1e3a8a] text-white shadow-md ring-4 ring-[#1e3a8a]/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-[11px] sm:text-xs hidden sm:inline">Formule & Cycle</span>
            </div>

            <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep >= 2 ? 'bg-[#1e3a8a] dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 2 ? 'text-[#1e3a8a] dark:text-blue-400 font-bold' : 'text-slate-400'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep > 2 
                  ? 'bg-emerald-600 text-white' 
                  : currentStep === 2 
                  ? 'bg-[#1e3a8a] text-white shadow-md ring-4 ring-[#1e3a8a]/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > 2 ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-[11px] sm:text-xs hidden sm:inline">Informations</span>
            </div>

            <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep >= 3 ? 'bg-[#1e3a8a] dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

            {/* Step 3 */}
            <div className={`flex flex-col items-center gap-1.5 ${currentStep >= 3 ? 'text-[#1e3a8a] dark:text-blue-400 font-bold' : 'text-slate-400'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep > 3 
                  ? 'bg-emerald-600 text-white' 
                  : currentStep === 3 
                  ? 'bg-[#1e3a8a] text-white shadow-md ring-4 ring-[#1e3a8a]/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > 3 ? <Check className="h-4 w-4" /> : '3'}
              </div>
              <span className="text-[11px] sm:text-xs hidden sm:inline">Paiement</span>
            </div>

            <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep >= 4 ? 'bg-[#1e3a8a] dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

            {/* Step 4 */}
            <div className={`flex flex-col items-center gap-1.5 ${currentStep === 4 ? 'text-[#1e3a8a] dark:text-blue-400 font-bold' : 'text-slate-400'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep === 4 
                  ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-600/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                4
              </div>
              <span className="text-[11px] sm:text-xs hidden sm:inline">Confirmation</span>
            </div>

          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Box */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: PLAN & CYCLE */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md"
                >
                  <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-300 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 mb-2">
                      Étape 1 sur 4
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Choisissez Votre Formule d'Abonnement</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sélectionnez la formule issue de la base de données et votre fréquence de facturation.</p>
                  </div>

                  {/* Plan Selector Grid */}
                  <div className="space-y-4 mb-8">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Offres Disponibles en Base de Données :
                    </label>

                    <div className="grid gap-3">
                      {plans.map((p) => {
                        const isSelected = selectedPlan?.id === p.id || selectedPlan?.code === p.code
                        return (
                          <div
                            key={p.id}
                            onClick={() => { setSelectedPlan(p); setPaymentProvider(p.providers?.[0] || ''); setPaymentError(null) }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              isSelected
                                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#1e3a8a] dark:border-blue-500 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                                isSelected ? 'bg-[#1e3a8a] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                              }`}>
                                <Zap className="h-5 w-5" />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                                  {p.badge && (
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                                      {p.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                {billingCycle === 'ANNUALLY' ? p.priceAnnually : p.priceMonthly}
                              </span>
                              <div className="mt-1">
                                <span className={`inline-block h-4 w-4 rounded-full border-2 ${
                                  isSelected ? 'border-[#1e3a8a] bg-[#1e3a8a]' : 'border-slate-400'
                                }`} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Billing Frequency Switch */}
                  <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Fréquence de Facturation :
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBillingCycle('MONTHLY')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          billingCycle === 'MONTHLY'
                            ? 'bg-white dark:bg-slate-900 border-[#1e3a8a] text-[#1e3a8a] dark:text-blue-400 shadow-sm'
                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Mensuel sans engagement
                      </button>

                      <button
                        type="button"
                        onClick={() => setBillingCycle('ANNUALLY')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer relative ${
                          billingCycle === 'ANNUALLY'
                            ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] border-transparent text-white shadow-sm'
                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>Annuel (2 Mois Offerts)</span>
                        <span className="ml-1 text-[10px] uppercase font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                          -20%
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>Continuer vers Informations</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: USER INFOS & PROMO */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md"
                >
                  <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-300 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 mb-2">
                      Étape 2 sur 4
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Vos Coordonnées & Identité</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Renseignez les détails d'identification de votre compte UniFlow.</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nom complet ou Raison sociale <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Paul Biya / Faculté des Sciences"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:border-[#1e3a8a] focus:outline-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Adresse Email de réception <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre.email@uniflow.edu"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:border-[#1e3a8a] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Numéro de Téléphone / WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+237 6XX XX XX XX"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:border-[#1e3a8a] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Établissement / Université (Optionnel)
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ex: Université de Yaoundé I, Douala, Dschang..."
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:border-[#1e3a8a] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
                    Les éventuelles réductions sont validées par le backend lors du checkout. Aucun code promo local n’est appliqué par cette interface.
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Étape Précédente</span>
                    </button>

                    <button
                      type="button"
                      disabled={!fullName || !email}
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1e3a8a] hover:bg-[#2d4fa8] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>Passer au Paiement</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT METHOD */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md"
                >
                  <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-300 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 mb-2">
                      Étape 3 sur 4
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Sélection du Mode de Paiement</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{includedAccess ? 'Cet accès académique est déjà inclus et ne requiert aucun paiement.' : 'Sélectionnez un moyen de paiement réellement configuré pour cette formule Appwrite.'}</p>
                  </div>

                  {paymentError && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">{paymentError}</div>}

                  {/* Payment Options */}
                  <div className="space-y-4 mb-8">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Moyen de Règlement Sécurisé :
                    </label>

                    {selectedPlan.providers?.length ? <div className="grid sm:grid-cols-2 gap-3">
                      {selectedPlan.providers?.includes('MTN_MOMO') && <>
                      {/* MTN MoMo */}
                      <button
                        type="button"
                        onClick={() => setPaymentProvider('MTN_MOMO')}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                          paymentProvider === 'MTN_MOMO'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-6 w-6 text-amber-600 shrink-0" />
                          <div>
                            <span className="font-bold text-xs sm:text-sm block">MTN Mobile Money</span>
                            <span className="text-[11px] text-slate-500">Cameroun & CEMAC</span>
                          </div>
                        </div>
                        <span className={`h-4 w-4 rounded-full border-2 ${paymentProvider === 'MTN_MOMO' ? 'bg-amber-500 border-amber-500' : 'border-slate-400'}`} />
                      </button>
                      </>}

                      {selectedPlan.providers?.includes('ORANGE_MONEY') && <>
                      {/* Orange Money */}
                      <button
                        type="button"
                        onClick={() => setPaymentProvider('ORANGE_MONEY')}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                          paymentProvider === 'ORANGE_MONEY'
                            ? 'bg-orange-500/10 border-orange-500 text-orange-900 dark:text-orange-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-6 w-6 text-orange-600 shrink-0" />
                          <div>
                            <span className="font-bold text-xs sm:text-sm block">Orange Money</span>
                            <span className="text-[11px] text-slate-500">Paiement Mobile Afrique</span>
                          </div>
                        </div>
                        <span className={`h-4 w-4 rounded-full border-2 ${paymentProvider === 'ORANGE_MONEY' ? 'bg-orange-500 border-orange-500' : 'border-slate-400'}`} />
                      </button>
                      </>}

                      {selectedPlan.providers?.includes('NOTCHPAY') && <>
                      {/* NotchPay */}
                      <button
                        type="button"
                        onClick={() => setPaymentProvider('NOTCHPAY')}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                          paymentProvider === 'NOTCHPAY'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="h-6 w-6 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-xs sm:text-sm block">NotchPay Express</span>
                            <span className="text-[11px] text-slate-500">Aggrégateur multi-canaux</span>
                          </div>
                        </div>
                        <span className={`h-4 w-4 rounded-full border-2 ${paymentProvider === 'NOTCHPAY' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400'}`} />
                      </button>
                      </>}

                      {selectedPlan.providers?.includes('STRIPE') && <>
                      {/* Stripe / Card */}
                      <button
                        type="button"
                        onClick={() => setPaymentProvider('STRIPE')}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                          paymentProvider === 'STRIPE'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-bold text-xs sm:text-sm block">Carte Bancaire / Stripe</span>
                            <span className="text-[11px] text-slate-500">Visa, Mastercard, Apple Pay</span>
                          </div>
                        </div>
                        <span className={`h-4 w-4 rounded-full border-2 ${paymentProvider === 'STRIPE' ? 'bg-blue-500 border-blue-500' : 'border-slate-400'}`} />
                      </button>
                      </>}
                    </div> : <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">{includedAccess ? 'Accès académique inclus : aucune transaction ni donnée de paiement ne sont nécessaires.' : 'Aucun moyen de paiement n’est configuré pour cette formule dans Appwrite.'}</p>}
                  </div>

                  {/* Payment Details Input */}
                  {(paymentProvider === 'MTN_MOMO' || paymentProvider === 'ORANGE_MONEY') && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 mb-8 space-y-3">
                      <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                        Numéro de Téléphone Mobile Money à Débiter :
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ex: 670000000 ou 690000000"
                        className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none"
                      />
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        La validation et les instructions de confirmation sont fournies par le prestataire de paiement via le backend.
                      </p>
                    </div>
                  )}

                  {paymentProvider === 'STRIPE' && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 mb-8 space-y-3">
                      <label className="block text-xs font-bold text-blue-900 dark:text-blue-300">
                        Paiement par carte via le prestataire configuré
                      </label>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Les données de carte sont saisies uniquement sur la page sécurisée du prestataire si un lien de paiement est renvoyé par le backend.
                      </p>
                    </div>
                  )}

                  {/* Guarantee banner */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Le statut affiché après cette étape provient exclusivement des documents de souscription Appwrite et d’un prestataire configuré, lorsqu’il existe.</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Étape Précédente</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || (!paymentProvider && !includedAccess)}
                      onClick={handleProcessPayment}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>{includedAccess ? 'Activer l’accès inclus' : `Valider et payer ${finalPrice.toLocaleString()} ${getCurrencyLabel()}`}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

                  {/* STEP 4: RESULTAT DU CHECKOUT */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl bg-white p-8 text-center shadow-lg dark:bg-slate-900"
                >
                  <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-8 ${paymentConfirmed ? 'bg-emerald-100 text-emerald-600 ring-emerald-50 dark:bg-emerald-950/80 dark:text-emerald-400 dark:ring-emerald-950/40' : 'bg-amber-100 text-amber-600 ring-amber-50 dark:bg-amber-950/80 dark:text-amber-400 dark:ring-amber-950/40'}`}>
                    {paymentConfirmed ? <CheckCircle2 className="h-10 w-10" /> : <RefreshCw className="h-10 w-10" />}
                  </div>

                  <span className={`mb-3 inline-block rounded-full px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider ${paymentConfirmed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'}`}>
                    {paymentConfirmed ? 'Paiement confirmé' : 'Paiement en attente de confirmation'}
                  </span>

                  <h2 className="mb-2 text-3xl font-black text-slate-900 dark:text-white">{paymentConfirmed ? 'Votre abonnement est actif' : 'Votre paiement doit encore être confirmé'}</h2>
                  <p className="mx-auto mb-8 max-w-md text-sm text-slate-600 dark:text-slate-300">
                    {paymentConfirmed ? 'Le backend a confirmé la transaction et l’activation de votre abonnement.' : 'Le backend a initialisé la transaction. Suivez le lien de paiement ou validez la demande Mobile Money, puis consultez le statut depuis votre espace.'}
                  </p>

                  <div className="mx-auto mb-8 max-w-md space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-xs dark:border-slate-700 dark:bg-slate-800/60">
                    {transactionResult?.transactionId && <div className="flex justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-700"><span className="text-slate-500">Référence transaction :</span><span className="font-mono font-bold text-slate-900 dark:text-white">{transactionResult.transactionId}</span></div>}
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-700"><span className="text-slate-500">Formule :</span><span className="font-bold text-slate-900 dark:text-white">{selectedPlan?.name}</span></div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-700"><span className="text-slate-500">Statut backend :</span><span className="font-bold text-slate-900 dark:text-white">{transactionResult?.status || 'PENDING'}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-slate-500">Montant :</span><span className="font-extrabold text-[#0d9488]">{finalPrice.toLocaleString()} {getCurrencyLabel()}</span></div>
                  </div>

                  {transactionResult?.paymentUrl && !paymentConfirmed && <a href={transactionResult.paymentUrl} target="_blank" rel="noreferrer" className="mb-6 inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">Poursuivre le paiement sécurisé <ArrowRight className="h-4 w-4" /></a>}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to="/app"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                    >
                      <span>Accéder à mon Espace UniFlow</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      to="/pricing"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Voir mes abonnements</span>
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Sidebar Summary Card */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-md">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a] text-white shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Récapitulatif de Commande</h3>
                  <p className="text-[11px] text-slate-500">Données issues de la BD UniFlow</p>
                </div>
              </div>

              {selectedPlan ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-500">Formule sélectionnée :</span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{selectedPlan.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedPlan.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cycle :</span>
                      <span className="font-semibold">{billingCycle === 'ANNUALLY' ? 'Annuel (-20%)' : 'Mensuel'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white">
                      <span>Total à régler :</span>
                      <span className="text-lg text-[#0d9488] font-black">{finalPrice.toLocaleString()} {getCurrencyLabel()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Services inclus :</p>
                    {selectedPlan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Aucune formule sélectionnée.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      <LandingFooter />
    </div>
  )
}
