'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletIcon, ChevronDown } from "lucide-react"

interface NavbarComponentProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}

export function NavbarComponent({ selectedOption, setSelectedOption }: NavbarComponentProps) {
  return (
    <nav className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center">
        <WalletIcon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Select connect method:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {selectedOption} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => setSelectedOption("Traditional")}>Traditional</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedOption("In-App")}>In-App</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedOption("Account Abstraction")}>Account Abstraction</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedOption("In-App + AA")}>In-App + AA</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}