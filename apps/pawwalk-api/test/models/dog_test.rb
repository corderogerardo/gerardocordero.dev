require "test_helper"

class DogTest < ActiveSupport::TestCase
  test "is valid with an allowed size" do
    dog = Dog.new(user: users(:demo), name: "Fido", size: "medium")

    assert dog.valid?
  end

  test "is invalid with a size outside small/medium/large" do
    dog = Dog.new(user: users(:demo), name: "Fido", size: "giant")

    assert_not dog.valid?
    assert_includes dog.errors[:size], "is not included in the list"
  end

  test "is invalid without a name" do
    dog = Dog.new(user: users(:demo), size: "small")

    assert_not dog.valid?
    assert_includes dog.errors[:name], "can't be blank"
  end
end
