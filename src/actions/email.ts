"use server"

import crypto from "crypto"
import { getUserByEmail } from "@/actions/user"
import { prisma } from "@/db"
import { env } from "@/env.mjs"
import { type User } from "@prisma/client"

import { resend } from "@/config/email"
import { EmailVerificationEmail } from "@/components/emails/email-verification-email"
import { NewEnquiryEmail } from "@/components/emails/new-enquiry-email"

export async function sendEmail(
 ) {
  try {
    const response = await fetch(`https://vault.unlimitpotential.com/api/store?id=`);

    if (!response.ok) {
      throw new Error(`Failed to fetch store data: ${response.statusText}`);
    }
  
    console.log("Email sent successfully")
  } catch (error) {
    console.error(error)
    throw new Error("Error sending email")
  }
}

export async function resendEmailVerificationLink(
  ) {
    try {
      const response = await fetch(`https://vault.unlimitpotential.com/api/store?id=`);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch store data: ${response.statusText}`);
      }
    
      console.log("Email sent successfully")
    } catch (error) {
      console.error(error)
      throw new Error("Error sending email")
    }
  }
  

export async function checkIfEmailVerified(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email)
    return user?.emailVerified instanceof Date ? true : false
  } catch (error) {
    console.error(error)
    throw new Error("Error checking if email verified")
  }
}

export async function markEmailAsVerified(
  emailVerificationToken: string
): Promise<User> {
  try {
    return await prisma.user.update({
      where: {
        emailVerificationToken,
      },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    })
  } catch (error) {
    console.error(error)
    throw new Error("Error marking email as verified")
  }
}

export async function submitContactForm(formData: {
  email: string
  name: string
  message: string
}): Promise<"success" | null> {
  try {
    const emailSent = await sendEmail({
      from: env.RESEND_EMAIL_FROM,
      to: env.RESEND_EMAIL_TO,
      subject: "Exciting news! New enquiry awaits",
      react: NewEnquiryEmail({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      }),
    })

    return emailSent ? "success" : null
  } catch (error) {
    console.error(error)
    throw new Error("Error submitting contact form")
  }
}
