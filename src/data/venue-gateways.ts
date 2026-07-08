import type { VenueGateway } from "@/types/venue-gateway"

export const venueGateways: VenueGateway[] = [
  {
    id: "1",
    venue: "Little Rock",
    gateway: "PayTrace",
    partner: "",
    vendor: "",
    user: "paytrace_user",
    password: "paytrace_pass",
  },
  {
    id: "2",
    venue: "St. Charles Funny Bone",
    gateway: "Stripe",
    partner: "",
    vendor: "",
    user: "stripe_publishable_key_sample",
    password: "stripe_secret_key_sample",
  },
  {
    id: "3",
    venue: "Tulsa",
    gateway: "PayPal",
    partner: "Paypal",
    vendor: "maxsum",
    user: "paypal_api_user",
    password: "paypal_api_secret",
  },
  {
    id: "4",
    venue: "Cleveland Improv",
    gateway: "PayTrace",
    partner: "",
    vendor: "",
    user: "cleveland_paytrace",
    password: "cleveland_secret",
  },
  {
    id: "5",
    venue: "Orlando Improv",
    gateway: "Stripe",
    partner: "",
    vendor: "",
    user: "stripe_publishable_key_orlando",
    password: "stripe_secret_key_orlando",
  },
]
