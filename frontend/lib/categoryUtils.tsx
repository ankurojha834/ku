import { Bug, CloudRain, Leaf, Sprout } from "lucide-react"
import type { Message } from "@/components/krishibot"

export const getCategoryIcon = (category: Message["category"]) => {
  switch (category) {
    case "crop":
      return <Sprout className="w-3 h-3" />
    case "weather":
      return <CloudRain className="w-3 h-3" />
    case "pest":
      return <Bug className="w-3 h-3" />
    case "fertilizer":
      return <Leaf className="w-3 h-3" />
    default:
      return null
  }
}

export const getCategoryColor = (category: Message["category"]) => {
  switch (category) {
    case "crop":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "weather":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "pest":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "fertilizer":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}
