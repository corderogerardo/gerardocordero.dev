import { FC, ReactElement } from 'react'

export default function Annotations({ message }: { message: string }): ReactElement | null {
  return (
    <div>
      A message: {message}
    </div>
  )
}

export const Message: FC<{ message: string }> = ({ children, message }) => {
  return <div>A message: {message}</div>
}
