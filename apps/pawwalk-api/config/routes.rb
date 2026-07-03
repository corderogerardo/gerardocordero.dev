Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  post "/signup", to: "users#create"
  post "/login", to: "sessions#create"
  get "/me", to: "me#show"

  resources :walkers, only: %i[index show]
  resources :bookings, only: %i[index show create] do
    member do
      patch :cancel
    end

    resource :pay, only: :create, controller: :payments
    resource :walk_session, only: %i[create update]
    resources :location_pings, only: %i[index create]
  end

  post "/stripe/webhooks", to: "stripe_webhooks#create"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  mount ActionCable.server => "/cable"

  # Defines the root path route ("/")
  # root "posts#index"
end
