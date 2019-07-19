pragma solidity >=0.4.20;
//^0.5.1
import "../node_modules/@aragon/os/contracts/apps/AragonApp.sol";

contract DAppWallApp is AragonApp {

    // ACL
    bytes32 constant public INPUT_IP_ROLE = keccak256("INPUT_IP_ROLE");
    
    // Events
    event listIP(
        address indexed _from,
        bytes32 indexed _swarmHashList
    );

     // State
    bytes32 public swarmHashList;

    function initialize() public onlyInit {
        initialized();
    }

    function update(bytes32 _swarmHashList) external auth(INPUT_IP_ROLE) {
        // Events are emitted using 'emit', followed by
        // the name of the event and the arguments
        // (if any) in parentheses. Any such invocation
        // (even deeply nested) can be detected from
        // the JavaScript API by filtering for 'Deposit'
        swarmHashList = _swarmHashList;
        emit listIP(msg.sender, _swarmHashList);
    }
}
