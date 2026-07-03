# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

[
  { name: "Luna Martinez", city: "Austin", price_per_30_min_cents: 2500 },
  { name: "Sam Okafor", city: "Portland", price_per_30_min_cents: 2200 },
  { name: "Priya Shah", city: "Chicago", price_per_30_min_cents: 2800 },
  { name: "Jonah Lee", city: "Denver", price_per_30_min_cents: 2000 }
].each do |attrs|
  Walker.find_or_create_by!(name: attrs[:name]) do |walker|
    walker.city = attrs[:city]
    walker.price_per_30_min_cents = attrs[:price_per_30_min_cents]
  end
end

demo_user = User.find_or_create_by!(email: "demo@pawwalk.dev") do |user|
  user.name = "Demo User"
  user.password = "walkies123"
end

mochi = Dog.find_or_create_by!(user: demo_user, name: "Mochi") do |dog|
  dog.breed = "Shiba Inu"
  dog.size = "small"
end

Dog.find_or_create_by!(user: demo_user, name: "Rex") do |dog|
  dog.breed = "Labrador"
  dog.size = "large"
end

luna = Walker.find_by!(name: "Luna Martinez")

Booking.find_or_create_by!(user: demo_user, dog: mochi, walker: luna) do |booking|
  booking.starts_at = 1.day.from_now.change(hour: 10, min: 0)
  booking.price_cents = luna.price_per_30_min_cents
  booking.status = :confirmed
end
