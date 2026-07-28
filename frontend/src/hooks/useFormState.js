import { useState } from 'react'

/**
 * Controlled form state for inputs that carry a `name` attribute.
 * @param {object|Function} initialState
 * @param {Function} [onChange] called after every change, e.g. to clear an error message
 */
export const useFormState = (initialState, onChange) => {
  const [formData, setFormData] = useState(initialState)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(current => ({ ...current, [name]: value }))
    if (onChange) onChange()
  }

  return { formData, setFormData, handleChange }
}

export default useFormState
