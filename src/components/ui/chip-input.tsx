import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "./badge"

interface ChipInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  badgeClassName?: string
  suggestions?: string[]
}

export function ChipInput({ value, onChange, placeholder = "Type a skill and press Enter", className, badgeClassName, suggestions = [] }: ChipInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault()
      const trimmed = inputValue.replace(/,/g, '').trim()
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
        setInputValue("")
        setShowSuggestions(false)
      } else if (trimmed) {
        setInputValue("")
        setShowSuggestions(false)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    if (!pastedText) return

    const newChips = pastedText
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '')

    const uniqueNewChips = newChips.filter(item => !value.includes(item))
    
    // De-duplicate within the pasted chips themselves
    const finalChipsToAdd = Array.from(new Set(uniqueNewChips))

    if (finalChipsToAdd.length > 0) {
      onChange([...value, ...finalChipsToAdd])
    }
    
    setInputValue("")
    setShowSuggestions(false)
  }

  const removeChip = (chipToRemove: string) => {
    onChange(value.filter(chip => chip !== chipToRemove))
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange([...value, suggestion])
    setInputValue("")
    setShowSuggestions(false)
  }

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-1 focus-within:ring-ring relative ${className}`}>
      {value.map((chip) => (
        <Badge key={chip} variant="secondary" className={`gap-1 px-2 py-1 ${badgeClassName || ''}`}>
          {chip}
          <button
            type="button"
            className="rounded-full outline-none hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => removeChip(chip)}
          >
            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Remove {chip}</span>
          </button>
        </Badge>
      ))}
      <div className="flex-1 min-w-[200px] relative">
        <input
          type="text"
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
             setInputValue(e.target.value)
             setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setShowSuggestions(false)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full max-w-[300px] bg-popover border text-popover-foreground shadow-md rounded-md z-50 max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input onBlur from firing first
                  handleSuggestionClick(suggestion);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
