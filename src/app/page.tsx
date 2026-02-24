'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AirdropForm } from '@/components/AirdropForm';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Background gradient effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-br from-purple-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-tl from-cyan-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="relative flex-1 pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Token Airdrop
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Distribute ERC-20 tokens to multiple wallets in a single transaction
            </p>
          </div>

          {/* Airdrop Form Card */}
          <AirdropForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
