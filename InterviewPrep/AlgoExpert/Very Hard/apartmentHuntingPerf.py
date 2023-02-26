# Apartment Hunting
# O(b*r) time | O(br) space

def apartmentHunting(blocks, reqs):
    minDistancesFromBlocks = list(map(lambda req: getMinDistances(blocks, req), reqs))
    maxDistancesAtBlocks = getMaxDistancesAtBlocks(blocks, minDistancesFromBlocks)
    return getIdxAtMinValue(maxDistancesAtBlocks)


def getMinDistances(blocks, req):
    minDistances = [0 for block in blocks]
    closestReqInx = float('inf')
    for i in range(len(blocks)):
        if blocks[i][req]:
            closestReqInx = i
        minDistances[i] = distanceBetween(i, closestReqInx)
    for i in reversed(range(len(blocks))):
        if blocks[i][req]:
            closestReqInx = i
        minDistances[i] = min(minDistances[i], distanceBetween(i, closestReqInx))
    return minDistances


def getMaxDistancesAtBlocks(blocks, minDistancesFromBlocks):
    maxDistancesAtBlocks = [0 for block in blocks]
    for i in range(len(blocks)):
        minDistanceAtBlock = list(map(lambda distances: distances[i], minDistancesFromBlocks))
        maxDistancesAtBlocks[i] = max(minDistanceAtBlock)
    return maxDistancesAtBlocks


def getIdxAtMinValue(array):
    idxAtMinValue = 0
    minValue = float("inf")
    for i in range(len(array)):
        currentValue = array[i]
        if currentValue < minValue:
          minValue = currentValue
          idxAtMinValue = i
    return idxAtMinValue

def distanceBetween(a, b):
    return abs(a - b)

# Improvements:

# In the getMinDistances function, you can simplify the two for-loops by combining them into one. This would reduce the time complexity from O(2rb) to O(rb), which is a significant improvement.
# In the getMaxDistancesAtBlocks function, you can simplify the code by using a list comprehension instead of a for-loop. This would make the code more concise and easier to read.
# In the getIdxAtMinValue function, you can use the enumerate function instead of using a for-loop to iterate over the indices of the array. This would make the code more concise and easier to read.
# It would be helpful to add some comments to the code to explain what each function does, what arguments it takes, and what it returns. This would make the code more readable and easier to understand for other developers who might work with this code in the future.
# Finally, it would be good to add some test cases to ensure that the code is working correctly.

# Apartment Hunting
# O(br) time | O(br) space

def apartmentHunting(blocks, reqs):
    # Find the minimum distance from each block to each requirement.
    minDistancesFromBlocks = [getMinDistances(blocks, req) for req in reqs]

    # Find the maximum of the minimum distances for each block.
    maxDistancesAtBlocks = [max(distances) for distances in zip(*minDistancesFromBlocks)]

    # Return the index of the block with the minimum maximum distance.
    return getIdxAtMinValue(maxDistancesAtBlocks)


def getMinDistances(blocks, req):
    minDistances = [float("inf") for block in blocks]
    closestReqInx = None
    for i, block in enumerate(blocks):
        if block[req]:
            closestReqInx = i
        if closestReqInx is not None:
            minDistances[i] = distanceBetween(i, closestReqInx)

    for i in reversed(range(len(blocks))):
        block = blocks[i]
        if block[req]:
            closestReqInx = i
        if closestReqInx is not None:
            minDistances[i] = min(minDistances[i], distanceBetween(i, closestReqInx))

    return minDistances


def getIdxAtMinValue(array):
    # Find the index of the minimum value in the array.
    return min(range(len(array)), key=array.__getitem__)


def distanceBetween(a, b):
    # Calculate the distance between two blocks.
    return abs(a - b)

