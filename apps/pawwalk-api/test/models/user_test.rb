require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "normalizes email to a stripped, downcased value" do
    user = User.new(name: "Alex", email: "  Alex@Example.com  ", password: "walkies123")

    assert user.valid?
    assert_equal "alex@example.com", user.email
  end

  test "is invalid without a unique email" do
    dupe = User.new(name: "Copycat", email: users(:demo).email, password: "walkies123")

    assert_not dupe.valid?
    assert_includes dupe.errors[:email], "has already been taken"
  end

  test "is invalid without a name" do
    user = User.new(email: "new@example.com", password: "walkies123")

    assert_not user.valid?
    assert_includes user.errors[:name], "can't be blank"
  end

  test "authenticates with the correct password via has_secure_password" do
    user = users(:demo)

    assert user.authenticate("walkies123")
    assert_not user.authenticate("wrong-password")
  end
end
