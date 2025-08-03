-- Add cart table to support session-based and user-based carts
-- This table acts as a container for cart items and supports both guest and authenticated users

CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either user_id or session_id is provided
    CONSTRAINT cart_user_or_session CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    )
);

-- Add index for fast cart lookup
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_session_id ON cart(session_id);
CREATE INDEX idx_cart_expires_at ON cart(expires_at);

-- Update cart_items table to reference cart table instead of direct user reference
-- First, let's add the cart_id column
ALTER TABLE cart_items ADD COLUMN cart_id UUID REFERENCES cart(id) ON DELETE CASCADE;

-- Update the table structure to match our application expectations
-- Remove the direct user_id reference and unique constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_variant_id_key;

-- Add new constraints
ALTER TABLE cart_items ADD CONSTRAINT unique_cart_item UNIQUE(cart_id, product_id, variant_id);

-- Update column names to match our application
ALTER TABLE cart_items RENAME COLUMN variant_id TO variation_id;
ALTER TABLE cart_items RENAME COLUMN unit_price TO price;
