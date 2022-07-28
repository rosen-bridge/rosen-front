import React, {useState, Fragment} from 'react';
import {Typography, AccordionDetails, AccordionSummary, Accordion} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
    {
        title: "Category 1",
        children: [
            {
                que: "What is Rosen bridge?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
            },{
                que: "What is Rosen used for?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            },{
                que: "How does Rosen work?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            },{
                que: "What kind of assets can be bridged using Rosen?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            }
        ]
    },{
        title: "Category 2",
        children: [
            {
                que: "What is Rosen bridge?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
            },{
                que: "What is Rosen used for?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            },{
                que: "How does Rosen work?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            },{
                que: "What kind of assets can be bridged using Rosen?",
                ans: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            }
        ]
    }
]

export default function Faqs() {
    const [expanded, setExpanded] = useState(null);

    const handle_change = (panel) => (event, isExpanded) => {
        setExpanded(expanded === panel ? null : panel);
    };

    return (
        <Fragment>
            {faqs.map((cat,j) => (
                <Fragment key={j}>
                    <Typography sx={{m:2, mb:1, fontSize: "small", letterSpacing: 2}} color="textSecondary">{cat.title}</Typography>
                    <div>
                    {cat.children.map((item,index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === `${j}-${index}`}
                            onChange={handle_change(`${j}-${index}`)}
                            disableGutters
                            variant="outlined"
                            sx={{
                                bgcolor: "background.content",
                                '&:not(:last-child)': {
                                    borderBottom: 0,
                                }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{item.que}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{item.ans}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    </div>
                </Fragment>
            ))}
        </Fragment>
    );
}
