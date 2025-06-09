// frontend/src/components/ui/EmptyState.jsx
import Button from './Button'

const EmptyState = ({ title, description, actionText, actionLink }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-500 max-w-md mx-auto">{description}</p>
      <div className="mt-6">
        <Button as="a" href={actionLink}>
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default EmptyState