use anchor_lang::prelude::*;

// Define the program ID
declare_id!("9Yyu16cGeVGso1FjLdSmgCPNSGpGLkPoXgqLfQ8N5zt5");

#[program]
pub mod patient_data_chain {
    use super::*;

    pub fn store_patient_data(ctx: Context<StorePatientData>, ipfs_hash: String) -> Result<()> {
        let patient_data = &mut ctx.accounts.patient_data;
        patient_data.ipfs_hash = ipfs_hash;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StorePatientData<'info> {
    #[account(init, payer = user, space = 8 + 64)]
    pub patient_data: Account<'info, PatientData>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Define a struct to store the IPFS hash
#[account]
pub struct PatientData {
    pub ipfs_hash: String,
}