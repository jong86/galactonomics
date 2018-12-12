pragma solidity ^0.4.24;

library Array256Lib {
  function contains(uint256[] storage _self, uint256 _num) internal view returns (bool) {
    for (uint i = 0; i < _self.length; i++) {
      if (_self[i] == _num) {
        return true;
      }
    }
    return false;
  }

  /**
   * @notice Deletes given number from array (first instance found),
   *  copies last item in array to newly emptied index, and then shortens array by 1
   * @param _self Storage array containing uint256 type variables
   * @param _num Item to remove
   */
  function remove(uint256[] storage _self, uint256 _num) internal {
    uint length = _self.length;
    for (uint i = 0; i < length; i++) {
      if (_self[i] == _num) {
        // If in here then we found the index this num is at, now for array management:
        // Move last item in list to empty index
        _self[i] = _self[length - 1];
        // Delete last item
        delete _self[length - 1];
        // Shorten array by 1
        _self.length--;
        break;
      }
    }
  }
}
