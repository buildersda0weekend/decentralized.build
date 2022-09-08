import { Grid } from "@mui/material";
import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Item from "@mui/material/Box";
import { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";

function Members() {
  const [tooltip, showTooltip] = useState(true);
  const [members, setMembers] = useState(0);
  const getMember = async () => {
    const response = await proposalApi.get("api/members");
    console.log(response);
    let Address = response.data[0].address;
    let contcatAddress = Address;
    setMembers(contcatAddress);
  };
  useEffect(() => {
    getMember();
  });
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
        <Button size="medium" className="join-members" type="submit">
          View all
        </Button>
      </Grid>
      <Box sx={{ flexGrow: 1 }} className="member-container">
        <Grid container rowSpacing={2} spacing={2}>
          <Grid item xs={4}>
            <Item
              data-tip={members}
              onMouseEnter={() => showTooltip(true)}
              onMouseLeave={() => {
                showTooltip(false);
                setTimeout(() => showTooltip(true), 50);
              }}
              className="member-box"
            >
              <p>{members}</p>
            </Item>
          </Grid>
        </Grid>
      </Box>
      {tooltip && <ReactTooltip effect="solid" className="extraClass"/>}
    </Grid>
  );
}

export default Members;
