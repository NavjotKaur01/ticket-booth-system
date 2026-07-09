import { dashboardNewsImage } from "@/constants/assets"
import type { FeatureTip } from "@/types/feature-tip"

export const featureTips: FeatureTip[] = [
  {
    id: "feature-custom-sliders",
    header: "New Custom Sliders",
    navigateUrl: "",
    description:
      "We can customize from self loading to custom made onto your website",
    imageUrl: dashboardNewsImage(1),
    imageName: "img1.bmp",
  },
  {
    id: "feature-online-seating",
    header: "Online Seating",
    navigateUrl:
      "https://standupmedia.freshdesk.com/a/solutions/articles/5000886357",
    description: "You can now let customers pick their own seat online",
    imageUrl: dashboardNewsImage(2),
    imageName: "img2.bmp",
  },
  {
    id: "feature-limit-tickets",
    header: "Limit Tickets purchased for a show",
    navigateUrl:
      "https://standupmedia.freshdesk.com/a/solutions/articles/5000886358",
    description:
      "Steps to Setup Max Tickets for a show STEP 1: Go to Calendar and click the show for the date you want to set up. STEP 2: Right mouse click to bring up menu Select Reservation or from top menu click Reservation. STEP 3: Set Max Ticket in top right corner. Set up here any value more than 0 to make it work for reservations.",
    imageUrl: dashboardNewsImage(3),
    imageName: "img3.bmp",
  },
  {
    id: "feature-section-fees",
    header: "Section Fees",
    navigateUrl:
      "https://standupmedia.freshdesk.com/a/solutions/articles/5000886359",
    description: "New Section Fees",
    imageUrl: dashboardNewsImage(4),
    imageName: "img4.bmp",
  },
  {
    id: "feature-scanner-ios",
    header: "Scanner iOS 2.0",
    navigateUrl: "",
    description:
      "New Features Include: 1. Three Icons per Row - This allows us to enlarge the action buttons at the bottom. 2. Auto-close on confirmation - No need to manually close successful scans. 3. Improved scan feedback for door staff.",
    imageUrl: dashboardNewsImage(5),
    imageName: "img5.bmp",
  },
  {
    id: "feature-ticket-text",
    header: "Ticket Text Changes",
    navigateUrl:
      "https://standupmedia.freshdesk.com/a/solutions/articles/5000886360",
    description: "Customize your ticket message here!",
    imageUrl: dashboardNewsImage(6),
    imageName: "img6.bmp",
  },
]
