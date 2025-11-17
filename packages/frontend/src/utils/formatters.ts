// Utilitários para formatação de dados

export const formatCurrency = (value: number | string): string => {
  // Se o valor já é um número, formata diretamente
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Se é string, remove tudo que não é número
  const numericValue = value.replace(/\D/g, '')

  if (!numericValue) return 'R$ 0,00'

  // Converte para número e divide por 100 para ter os centavos
  const amount = parseInt(numericValue) / 100

  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export const parseCurrencyToNumber = (formattedValue: string): number => {
  // Remove formatação e converte para número
  const numericValue = formattedValue.replace(/\D/g, '')
  return numericValue ? parseInt(numericValue) / 100 : 0
}

// Tipo genérico para dados de formulário que contém um campo amount
interface FormDataWithAmount {
  amount: string
  [key: string]: string | number | Date
}

export const createAmountChangeHandler = <T extends FormDataWithAmount>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target?.value || ''
    const formattedValue = formatCurrency(value)
    setFormData((prev: T) => ({ ...prev, amount: formattedValue }))
  }
}
