import google.genai as genai
import os
import json
from typing import Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SUPPLY_CHAIN_SYSTEM_PROMPT = """
You are SmartChain AI, an intelligent supply chain 
assistant powered by Google Gemini. You help logistics
managers and supply chain professionals with:

- Real-time shipment tracking and status updates
- Inventory management and optimization
- Route optimization recommendations  
- Risk assessment and delay predictions
- Supplier performance analysis
- Demand forecasting insights
- Alert management and corrective actions

Always provide:
- Concise, actionable recommendations
- Data-driven insights when possible
- Professional supply chain terminology
- Step-by-step guidance for complex issues

You have access to supply chain data including 
shipments, inventory levels, ship locations, 
alerts, and operational metrics.
"""

# Initialize client globally
_client = None

def _get_client():
    global _client
    if _client is None and GEMINI_API_KEY:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def init_gemini():
    client = _get_client()
    return client is not None


def generate_content(prompt: str, system_instruction: Optional[str] = None):
    """Generate content using Gemini 2.0"""
    client = _get_client()
    if not client:
        return None
    
    config = genai.types.GenerateContentConfig(
        system_instruction=system_instruction or SUPPLY_CHAIN_SYSTEM_PROMPT,
        temperature=0.7,
        top_p=0.95,
        top_k=40,
        max_output_tokens=1024,
    )
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-001",
        contents=prompt,
        config=config
    )
    return response


async def chat_with_gemini(
    message: str,
    context: Optional[dict] = None,
    chat_history: Optional[list] = None
) -> dict:
    if not GEMINI_API_KEY:
        return {
            "response": None,
            "error": "Gemini API key not configured",
            "model": "gemini-2.0-flash-001",
            "powered_by": "Google Gemini"
        }

    try:
        enhanced_message = message
        if context:
            context_str = "\n".join([
                f"- {k}: {v}" 
                for k, v in context.items() 
                if v is not None
            ])
            if context_str:
                enhanced_message = (
                    f"Context:\n{context_str}\n\n"
                    f"Question: {message}"
                )

        response = generate_content(enhanced_message)

        if response and response.text:
            return {
                "response": response.text,
                "model": "gemini-2.0-flash-001",
                "powered_by": "Google Gemini",
                "error": None
            }
        else:
            return {
                "response": None,
                "error": "No response from Gemini",
                "model": "gemini-2.0-flash-001",
                "powered_by": "Google Gemini"
            }

    except Exception as e:
        return {
            "response": None,
            "error": str(e),
            "model": "gemini-2.0-flash-001",
            "powered_by": "Google Gemini"
        }


async def analyze_with_gemini(
    analysis_type: str,
    data: dict
) -> dict:

    prompts = {
        "shipment_risk": f"""
Analyze this shipment data for risks:
{data}
Provide: risk level (Low/Medium/High), 
top 3 risks, recommended actions.
Format as JSON with keys: 
risk_level, risks, recommendations
""",

        "inventory_forecast": f"""
Analyze inventory levels and predict 
restocking needs:
{data}
Provide: items needing restock, 
forecast demand, order recommendations.
Format as JSON with keys:
restock_needed, forecast, orders
""",

        "route_optimization": f"""
Analyze these routes and suggest optimizations:
{data}
Provide: current inefficiencies, 
optimized route suggestion, 
estimated time/cost savings.
Format as JSON with keys:
inefficiencies, optimized_route, savings
""",

        "operational_summary": f"""
Generate an executive summary of these 
supply chain operations:
{data}
Provide: overall health score (0-100),
key metrics, top issues, recommendations.
Format as JSON with keys:
health_score, metrics, issues, recommendations
"""
    }

    prompt = prompts.get(
        analysis_type,
        f"Analyze this supply chain data: {data}"
    )

    try:
        response = generate_content(prompt)

        if not response or not response.text:
            return {
                "analysis": None,
                "error": "No response from Gemini",
                "model": "gemini-2.0-flash-001",
                "powered_by": "Google Gemini"
            }

        text = response.text.strip()

        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        try:
            parsed = json.loads(text.strip())
        except json.JSONDecodeError:
            parsed = {"raw_analysis": response.text}

        return {
            "analysis": parsed,
            "model": "gemini-2.0-flash-001",
            "powered_by": "Google Gemini",
            "analysis_type": analysis_type
        }

    except Exception as e:
        return {
            "analysis": None,
            "error": str(e),
            "model": "gemini-2.0-flash-001",
            "powered_by": "Google Gemini"
        }