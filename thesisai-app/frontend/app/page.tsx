'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiFileText, FiEdit3, FiCheck, FiTrendingUp } from 'react-icons/fi'

export default function Home() {
  const features = [
    {
      icon: <FiEdit3 className="w-8 h-8" />,
      title: 'Smart Editor',
      description: 'Markdown editor with live preview, autosave, and version history'
    },
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: 'AI Assistant',
      description: 'Grammar checking, content generation, and style improvements'
    },
    {
      icon: <FiCheck className="w-8 h-8" />,
      title: 'Plagiarism Check',
      description: 'Built-in plagiarism detection with detailed reports'
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Progress Tracking',
      description: 'Monitor your writing progress with deadlines and milestones'
    }
  ]

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">ThesisAI</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-muted hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Write Better Academic Papers with AI
          </h2>
          <p className="text-xl text-muted mb-8">
            The only service that actively helps you write quality academic works, 
            teaching proper scientific style
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-6 py-3">
              Start Writing Free
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-6 py-3">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Excel
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card hover:border-primary transition-colors">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12">Simple Pricing</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card hover:border-primary transition-colors">
              <h4 className="text-xl font-semibold mb-4">Free</h4>
              <p className="text-3xl font-bold mb-4">$0<span className="text-base text-muted">/month</span></p>
              <ul className="text-left space-y-2 mb-6">
                <li>5 documents</li>
                <li>Basic checks</li>
                <li>Export to PDF</li>
              </ul>
              <Link href="/register" className="btn-secondary block text-center">
                Start Free
              </Link>
            </div>
            <div className="card border-primary">
              <h4 className="text-xl font-semibold mb-4">Student</h4>
              <p className="text-3xl font-bold mb-4">$9<span className="text-base text-muted">/month</span></p>
              <ul className="text-left space-y-2 mb-6">
                <li>Unlimited documents</li>
                <li>All AI features</li>
                <li>Priority support</li>
              </ul>
              <Link href="/register" className="btn-primary block text-center">
                Get Student
              </Link>
            </div>
            <div className="card hover:border-primary transition-colors">
              <h4 className="text-xl font-semibold mb-4">Pro</h4>
              <p className="text-3xl font-bold mb-4">$19<span className="text-base text-muted">/month</span></p>
              <ul className="text-left space-y-2 mb-6">
                <li>Everything in Student</li>
                <li>API access</li>
                <li>Team collaboration</li>
              </ul>
              <Link href="/register" className="btn-secondary block text-center">
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted">
          <p>&copy; 2024 ThesisAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}