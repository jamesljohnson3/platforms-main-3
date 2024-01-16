"use server"

import { sendEmail } from "@/actions/email"
import { prisma } from "@/db"
import { env } from "@/env.mjs"

import { NewsletterWelcomeEmail } from "@/components/emails/newsletter-welcome-email"

export async function checkIfSubscribedToNewsletter(
  email: string
): Promise<boolean> {
  try {
    const subscribed = await prisma.newsletterSubscriber.findUnique({
      where: {
        email,
      },
    })
    return subscribed ? true : false
  } catch (error) {
    console.error(error)
    throw new Error("Error checking if already subscribed to newsletter")
  }
}

export async function subscribeToNewsletter(
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
  