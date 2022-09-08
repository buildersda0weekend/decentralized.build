import { Grid } from "@mui/material";
import React from "react";
import Box from "@mui/material/Box";
import Item from "@mui/material/Box";
import { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import useContract from '../hooks/contracts/useContract';
import Typed from "react-typed"

function Members() {
  const [memberList , setMemberList] = useState([])
  const [tooltip, showTooltip] = useState(true);
  const [ tokenContract, governanceContract, treasuryContract ] = useContract()

  const members = async () => {
    if (!governanceContract) return
    const totalMemberCount = await governanceContract.methods.totalMembers().call()
    let allMembers = []
    for (let i = 1; i <= totalMemberCount; i++) {
      const member = await governanceContract.methods.members(i).call()
      console.log(member)
      allMembers.push(member)
    }
    console.log(allMembers.length)
    setMemberList(allMembers)
  }
  useEffect(() => {
    members()
  }, [governanceContract])
  
  return (
    <Grid container className="member-list-container">
      <Grid
        xs={12}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ marginTop: 4 }}
      >
        <span className="members-header">Members</span>
      </Grid>
      <Grid
        xs={6}
        display="flex"
        alignItems="center"
        justifyContent="start"
        sx={{ marginTop: 2 }}
      >
        <span>Active Members</span>
      </Grid>
      <Grid
        xs={6}
        display="flex"
        alignItems="center"
        justifyContent="end"
        sx={{ marginTop: 2 }}
      >
      <span>Total Members: {memberList.length} </span>
        {/* <Button size="medium" className="join-members" type="submit">
          View all
        </Button> */}
      </Grid>
      {memberList.length > 0 ?
        <Box sx={{ flexGrow: 1 }} className="member-container">
        <Grid container rowSpacing={2} spacing={4}>
        {memberList.map((item) => (
          <Grid item xs={4} key={item}>
            <Item
              data-tip={item}
              onMouseEnter={() => showTooltip(true)}
              onMouseLeave={() => {
                showTooltip(false);
                setTimeout(() => showTooltip(true), 50);
              }}
              className="member-box"
            >
              <span>{item}</span>
            </Item>
          
          </Grid>
      ))}
        </Grid>
      </Box> :
      <Typed className="not-available-members"
      strings={[
            "Please connect your wallet.",
            "Please add the member.",
            "No member yet.",
          ]}
          typeSpeed={50}
          backSpeed={50}
          loop
        />
    }
      {tooltip && <ReactTooltip effect="solid" className="extraClass"/>}
    </Grid>
  );
}

export default Members;
